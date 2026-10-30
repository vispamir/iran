import { createRequire } from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import type { ContentPage } from '../src/lib/content-model';
const require=createRequire(import.meta.url);
require.extensions['.css']=()=>{};
const page:ContentPage={schema_version:'1.0',page_id:'test',page_path:'/explore/test/',name:'Test',description:'Test',updated_at:'2026-10-30T00:00:00Z',as_of_date:'2026-10-30',editorial_status:'needs_research',seo:{title:'Test',description:'Test'},datasets:[],sources:[{id:'s1',title:'Source one',publisher:'Test',url:'https://example.com'}],related_pages:[],research_notes:{limitations:['Test gap'],unverified_items:[],data_gaps:[],coverage_period:null},content:[{id:'intro',type:'text',heading:'Story',content:'**Strong** text [s1]\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n<script>alert(1)</script>',source_ids:['s1']},{id:'image',type:'image',content:'/test.jpg',alt:'Test image',caption:'Related caption',source_ids:[]},{id:'video',type:'video',content:'https://example.com/test.mp4',alt:'Test video',source_ids:[]},{id:'diagram',type:'markdown-mermaid',content:'```mermaid\nflowchart LR\n A --> B\n```',summary:'Relationship',source_ids:[]}]};
test('article renders ordered Markdown, citations, accessible media and safe diagram fallback',async ()=>{
 const { ContentArticle }=await import('../src/components/content/ContentArticle');
 const html=renderToStaticMarkup(<ContentArticle page={page}/>);
 assert.match(html,/<strong>Strong<\/strong>/);assert.match(html,/<table>/);assert.match(html,/href="#source-s1"/);assert.doesNotMatch(html,/<script>/);assert.match(html,/alt="Test image"/);assert.match(html,/<video[^>]*controls=""/);assert.doesNotMatch(html,/autoPlay/);assert.match(html,/Loading diagram/);assert.match(html,/Relationship/);assert.ok(html.indexOf('Strong')<html.indexOf('test.jpg'));assert.ok(html.indexOf('test.jpg')<html.indexOf('test.mp4'));
});

test('chart renders an accessible underlying table with null values',async ()=>{
 const { ContentArticle }=await import('../src/components/content/ContentArticle');
 const fixture=structuredClone(page);fixture.datasets=[{id:'series',title:'Annual values',calendar:'solar_hijri',methodology:'Original calendar',geography:'Iran',limitations:['Historical only'],series:[{id:'a',name:'Measure',unit:'people',scale:1000,observations:[{year:1400,period_label:'1400',value:null,observation_status:'missing',source_ids:[]},{year:1401,period_label:'1401',value:0,observation_status:'observed',source_ids:['s1']}]}]}];
 fixture.content=[{id:'chart',type:'chart',source_ids:['s1'],content:{type:'line',title:'Chart title',dataset_id:'series',x_field:'period_label',series_ids:['a'],x_axis_label:'Year',y_axis_label:'Thousands of people',y_axis_min:null,show_legend:true,connect_nulls:false,interpretation:'Historical trend'}}];
 const html=renderToStaticMarkup(<ContentArticle page={fixture}/>);assert.match(html,/Not available/);assert.match(html,/solar_hijri/);assert.match(html,/×1000/);assert.match(html,/scope="row">1401/);assert.match(html,/Historical trend/);assert.match(html,/Historical only/);
});
