"""Exercise the real runner with a fake CLI, without paid/live model calls."""
import copy
import fcntl
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
RUNNER = ROOT / 'scripts/run-content-batches.py'


class RunnerTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        schedule = json.loads((ROOT / 'schedule-terms.json').read_text())
        schedule['batches'] = schedule['batches'][:1]
        schedule['terms'] = schedule['terms'][:3]
        schedule['batches'][0].update(state='pending', output_file=None, attempt_history=[])
        schedule['summary']={k: 0 for k in schedule['state_definitions']}
        schedule['summary']['pending']=3
        for term in schedule['terms']:
            term.update(state='pending', started_at=None, completed_at=None, output_file=None, blockers=[])
        ids = {t['page_id'] for t in schedule['terms']}
        for t in schedule['terms']:
            t['children_ids'] = [i for i in t['children_ids'] if i in ids]
        self.schedule = self.root / 'schedule.json'
        self.schedule.write_text(json.dumps(schedule))
        self.payload = self.root / 'payload.json'
        pages = []
        for term in schedule['terms']:
            p = dict(schema_version='1.0', **{k: term[k] for k in ('page_id', 'page_path', 'name', 'level', 'parent_path')},
                     entity_type='category', address=None, phone=None, email=None, website=None, logo=None,
                     contact_source_ids=[], description='Test fixture.', tags=['test'], status=None,
                     editorial_status='ready_for_review', as_of_date=schedule['as_of_date'],
                     created_at='2026-10-26T12:00:00Z', updated_at='2026-10-26T12:00:00Z',
                     seo={'title':term['name'], 'description':'Fixture'},
                     content=[{'id':'overview','type':'text','content':'Fixture [s1].','source_ids':['s1']}],
                     datasets=[], sources=[{'id':'s1','title':'Fixture','publisher':'Fixture','url':'https://example.org/source',
                     'language':'en','publication_date':None,'access_date':'2026-10-26','source_type':'test','locator':None}],
                     related_pages=[], research_notes={'limitations':[],'unverified_items':[],'data_gaps':[],'coverage_period':None})
            pages.append(p)
        self.pages = pages
        self.payload.write_text(json.dumps(pages))
        self.fake = self.root / 'codex-fake'
        self.fake.write_text('#!' + sys.executable + '''
import os, sys, time, json, re
from pathlib import Path
prompt = sys.stdin.read()
time.sleep(float(os.environ.get('FIXTURE_DELAY', '0')))
assert 'batch_page_ids' in prompt
assert '--sandbox' in sys.argv and 'read-only' in sys.argv
payload = Path(os.environ['FIXTURE_PAYLOAD'])
count_file = payload.with_suffix('.count')
count = int(count_file.read_text()) + 1 if count_file.exists() else 1
count_file.write_text(str(count))
value = payload.read_text()
if count <= int(os.environ.get('FIXTURE_FAIL_FIRST', '0')):
    value = '[]'
else:
    parsed = json.loads(value)
    ids = json.loads(re.search(r'"batch_page_ids": (\[.*?\])', prompt).group(1))
    value = json.dumps([p for p in parsed if p['page_id'] in ids])
Path(sys.argv[sys.argv.index('-o')+1]).write_text(value)
sys.exit(int(os.environ.get('FIXTURE_EXIT', '0')))
''')
        self.fake.chmod(0o755)

    def run_cli(self, *args, exit_code='0', delay='0', fail_first='0'):
        return subprocess.run([sys.executable,str(RUNNER),'--schedule',str(self.schedule),
            '--max-retries','0','--retry-delay','0','--output-dir',str(self.root / 'output'),'--codex',str(self.fake),*args],
            env={**os.environ,'FIXTURE_PAYLOAD':str(self.payload),'FIXTURE_EXIT':exit_code,'FIXTURE_DELAY':delay,'FIXTURE_FAIL_FIRST':fail_first}, capture_output=True,text=True)

    def state(self):
        return json.loads(self.schedule.read_text())

    def test_success_and_no_automatic_completion(self):
        result = self.run_cli()
        self.assertEqual(result.returncode,0,result.stderr)
        state = self.state()
        self.assertEqual(state['batches'][0]['state'],'ready_for_review')
        self.assertEqual(state['summary']['ready_for_review'],3)
        self.assertTrue(Path(state['batches'][0]['output_file']).exists())
        self.assertTrue(all(t['completed_at'] is None for t in state['terms']))
        self.assertNotEqual(self.run_cli('--batch','batch-0001').returncode,0)

    def test_dry_run_no_mutation(self):
        before = self.schedule.read_bytes()
        self.assertEqual(self.run_cli('--dry-run').returncode,0)
        self.assertEqual(self.schedule.read_bytes(),before)
        self.assertFalse((self.root / 'output').exists())
        self.assertFalse(Path(str(self.schedule)+'.lock').exists())

    def test_invalid_output_and_retry(self):
        self.payload.write_text('[]')
        self.assertEqual(self.run_cli().returncode,1)
        self.assertEqual(self.state()['summary']['blocked'],3)
        self.payload.write_text(json.dumps(self.pages))
        self.assertEqual(self.run_cli('--batch','batch-0001','--retry').returncode,0)
        self.assertEqual(self.state()['summary']['ready_for_review'],3)

    def test_cli_failure(self):
        self.assertEqual(self.run_cli(exit_code='9').returncode,1)
        self.assertIn('status 9',self.state()['batches'][0]['last_error'])

    def test_partial_research(self):
        self.pages[0]['editorial_status']='needs_research'
        self.pages[0]['research_notes']['unverified_items']=['Need evidence']
        self.payload.write_text(json.dumps(self.pages))
        self.assertEqual(self.run_cli().returncode,0)
        state=self.state()
        self.assertEqual(state['batches'][0]['state'],'needs_research')
        self.assertEqual(state['summary']['needs_research'],1)
        self.assertEqual(state['summary']['ready_for_review'],2)

    def test_timeout_blocks_batch(self):
        result=self.run_cli('--timeout','0.05',delay='5')
        self.assertEqual(result.returncode,1)
        self.assertIn('TimeoutExpired',self.state()['batches'][0]['last_error'])

    def test_schedule_lock(self):
        with Path(str(self.schedule)+'.lock').open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX | fcntl.LOCK_NB)
            result=self.run_cli()
        self.assertEqual(result.returncode,1)
        self.assertIn('Another runner',result.stderr)
        self.assertEqual(self.state()['batches'][0]['state'],'pending')

    def test_automatic_recovery(self):
        result=self.run_cli('--max-retries','2',fail_first='1')
        self.assertEqual(result.returncode,0,result.stderr)
        batch=self.state()['batches'][0]
        self.assertEqual(batch['state'],'ready_for_review')
        self.assertEqual(batch['retry_count'],1)
        self.assertEqual(len(batch['attempt_history']),2)
        retry_prompt=Path(batch['last_attempt'],'prompt.md').read_text()
        self.assertIn('previous attempt failed',retry_prompt)
        self.assertIsNone(batch['next_retry_at'])

    def test_retry_exhaustion(self):
        result=self.run_cli('--max-retries','2',fail_first='10')
        self.assertEqual(result.returncode,1)
        batch=self.state()['batches'][0]
        self.assertEqual(batch['state'],'blocked')
        self.assertEqual(len(batch['attempt_history']),3)
        self.assertIsNone(batch['next_retry_at'])

    def test_all_recovers_interrupted_state(self):
        state=self.state()
        state['batches'][0]['state']='researching'
        for term in state['terms']:
            term['state']='researching'
        self.schedule.write_text(json.dumps(state))
        result=self.run_cli('--all')
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual(self.state()['batches'][0]['state'],'ready_for_review')

    def test_continue_after_failed_batch(self):
        state=self.state()
        first=state['batches'][0]
        second=copy.deepcopy(first)
        first['page_ids']=first['page_ids'][:1]
        second.update(batch_id='batch-0002',order=2,page_ids=second['page_ids'][1:])
        state['batches'].append(second)
        self.schedule.write_text(json.dumps(state))
        result=self.run_cli('--all',fail_first='1')
        self.assertEqual(result.returncode,1,result.stderr)
        batches=self.state()['batches']
        self.assertEqual(batches[0]['state'],'blocked')
        self.assertEqual(batches[1]['state'],'ready_for_review')

    def test_fail_fast(self):
        state=self.state()
        second=copy.deepcopy(state['batches'][0])
        second.update(batch_id='batch-0002',order=2,page_ids=second['page_ids'][1:])
        state['batches'][0]['page_ids']=state['batches'][0]['page_ids'][:1]
        state['batches'].append(second)
        self.schedule.write_text(json.dumps(state))
        result=self.run_cli('--all','--fail-fast',fail_first='1')
        self.assertEqual(result.returncode,1)
        self.assertEqual(self.state()['batches'][1]['state'],'pending')

    def test_reference_rejection(self):
        pages=copy.deepcopy(self.pages)
        pages[0]['content'][0]['source_ids']=['unknown']
        self.payload.write_text(json.dumps(pages))
        self.assertEqual(self.run_cli().returncode,1)
        self.assertIn('unresolved source',self.state()['batches'][0]['last_error'])


if __name__ == '__main__':
    unittest.main()
