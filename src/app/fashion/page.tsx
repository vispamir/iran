import { BrandLogo } from '@/components/BrandLogo';
import Image from 'next/image';
import { FashionNav } from '@/components/fashion/FashionNav';
import './fashion.css';

export const metadata = {
 title: 'Fashion — Three Looks, Your Own Expression',
 description: 'A fresh generation of urban style: relaxed tailoring, expressive textiles and three coordinated wardrobes, from individual pieces to complete looks.',
};
const looks = [
 {id:'burgundy',title:'Softness in motion.',subtitle:'IVORY & BURGUNDY',word:'Soft',color:'#7c293d',description:'An airy ivory blouse meets a flowing tiered skirt. Burgundy accessories bring the palette together, while white sneakers keep the silhouette relaxed.',pieces:'Balloon-sleeve blouse · Tiered maxi skirt · Scarf · Shoulder bag · White sneakers',modelAlt:'Fictional adult woman with a realistic fully visible face wearing an ivory balloon-sleeve blouse, burgundy maxi skirt and scarf, shoulder bag and white sneakers'},
 {id:'noir',title:'After-dark structure.',subtitle:'BLACK & GOLD',word:'Bold',color:'#82704a',description:'A cropped blazer and wide-leg trousers build a clean, elongated line. A simple bandeau, pointed heels and delicate gold accents finish the monochrome look.',pieces:'Cropped blazer · Bandeau · Wide-leg trousers · Pointed heels · Quilted bag · Gold accessories',modelAlt:'Fictional adult woman with a realistic fully visible face wearing a black cropped blazer, bandeau, wide-leg trousers, pointed heels and gold accessories'},
 {id:'camel',title:'Layers with warmth.',subtitle:'CAMEL & WINE',word:'Warm',color:'#a2673f',description:'Camel tailoring frames a deep burgundy knit. A belted coat, softly tapered trousers, ankle boots and a cloche hat create a layered composition with warmth and character.',pieces:'Belted coat · High-neck knit · Tie-waist trousers · Ankle boots · Cloche hat · Structured bag',modelAlt:'Fictional adult woman with a realistic fully visible face wearing a camel coat and trousers, burgundy knit and ankle boots, camel cloche hat and burgundy handbag'},
];
function Label({children}:{children:React.ReactNode}) {return <p className="na-label">{children}</p>;}

export default function FashionPage() {
 return <div className="na-page"><div className="na-shell">
  <FashionNav/>
  <section className="na-outfit-intro" id="editorial">
   <div><Label>FASHION & CULTURE / A PERSONAL WARDROBE</Label><h1>Different moods.<br/><em>Your own expression.</em></h1></div>
   <div><p>Three looks. Three ways to put the pieces together. Explore the textures, proportions and small details that turn a collection of garments into a complete outfit.</p><a className="na-link" href="#style-guide">EXPLORE THE THREE LOOKS <span>↘</span></a></div>
  </section>
  <div className="na-running"><span>THE WARDROBE EDIT / 01—03</span><span>FROM THE PIECES TO THE PERSON.</span><span>IRAN, UNFOLDED</span></div>
  <section id="urban-style" className="na-urban na-section" aria-labelledby="na-urban-title">
   <div className="na-section-heading"><div><Label>THE NEXT GENERATION / URBAN STYLE</Label><h2 id="na-urban-title">A fresh perspective.<br/><em>A style of their own.</em></h2></div><p>A visual take on a younger generation’s approach to urban style: relaxed tailoring, expressive layers and familiar textures seen in a new light.</p></div>
   <div className="na-urban-grid">
    <figure><div className="na-urban-image"><Image src="/images/iran/7b89652ea6b1508961889dd7dde2be67.webp" alt="Model in a relaxed camel suit and black loafers, seated against richly patterned red and blue carpets" width={736} height={920} sizes="(max-width: 700px) 88vw, 44vw"/><div className="na-urban-caption"><Label>01 / RELAXED TAILORING</Label><h3>New proportions.<br/>Familiar textures.</h3></div></div><figcaption>Soft tailoring and an unstructured pose meet the color and rhythm of patterned carpets.</figcaption></figure>
    <figure><div className="na-urban-image"><Image src="/images/iran/737894c8f013020fbb8fe0e4e3fc79a3.webp" alt="Model wearing a red and gold embroidered jacket over cream separates, with a red head wrap beside a loom" width={736} height={1097} sizes="(max-width: 700px) 88vw, 44vw"/><div className="na-urban-caption"><Label>02 / EXPRESSIVE LAYERS</Label><h3>Heritage in color.<br/>Individual in spirit.</h3></div></div><figcaption>An embroidered outer layer, cream separates and a vivid red wrap create a personal dialogue between detail and silhouette.</figcaption></figure>
   </div>
   <p className="na-small na-urban-note">Supplied editorial references illustrating a styling direction, rather than documentary street photography. Locations, designers and dates are not attributed.</p>
  </section>
  <section id="style-guide" className="na-lookbook" aria-label="Three coordinated outfits">
   {looks.map((look,i)=><article key={look.id} className={`na-look na-look-${look.id}`} aria-labelledby={`look-${look.id}`}>
    <header className="na-look-heading"><Label>LOOK / 0{i+1}</Label><span>{look.subtitle}</span></header>
    <div className="na-look-stage">
     <span className="na-look-word" aria-hidden="true" style={{color:look.color}}>{look.word}</span>
     <figure className="na-outfit-board">
      <Image src={`/images/fashion/${look.id}-flatlay.webp`} alt={`Transparent outfit board: ${look.pieces}`} width={1024} height={1536} sizes="(max-width: 600px) 80vw, 43vw" preload={i===0}/>
      <figcaption>THE PIECES / 0{i+1}</figcaption>
     </figure>
     <figure className="na-outfit-model">
      <Image src={`/images/fashion/${look.id}-model.webp`} alt={look.modelAlt} width={1024} height={1536} sizes="(max-width: 600px) 85vw, 43vw" preload={i===0}/>
      <figcaption>THE COMPLETE LOOK / 0{i+1}</figcaption>
     </figure>
     <div className="na-look-overlay"><h2 id={`look-${look.id}`}>{look.title}</h2><p>{look.subtitle}</p></div>
    </div>
    <div className="na-look-notes"><p>{look.description}</p><p><span className="na-label">THE DETAILS</span>{look.pieces}</p></div>
   </article>)}
  </section>
  <section id="culture" className="na-outfit-context na-section"><div><Label>STYLE AS A LANGUAGE</Label><h2>Texture. Proportion.<br/><em>Individuality.</em></h2></div><div><p>A wardrobe can move between soft volume, precise tailoring and warm layers. These three supplied outfit references are a starting point for personal expression, rather than a uniform or a claim about how everyone dresses.</p><p className="na-small">Outfit boards are adapted from the supplied references. The models are AI-generated fictional adults, styled to show each coordinated set; these images are editorial interpretations, not documentary photographs.</p></div></section>
  <section id="designers" className="na-closing"><Label>THE STYLING VOCABULARY</Label><h2>The pieces are a beginning.<br/>The expression is <em>yours.</em></h2><p>Follow a color through the accessories. Balance a loose silhouette with a structured layer. Let a small detail change the whole mood.</p><a className="na-link" href="#style-guide">REVISIT THE LOOKS <span>↑</span></a></section>
  <footer className="na-footer"><a className="ir-logo" href="/" aria-label="Iran Unfolded home"><BrandLogo/></a><nav aria-label="Footer navigation"><a href="#editorial">Editorial</a><a href="#urban-style">Urban style</a><a href="#style-guide">The looks</a><a href="#culture">Culture</a><a href="#designers">Styling notes</a></nav><div><p>A fashion & culture editorial<br/>from <a href="/">IRAN, Unfolded ↗</a></p></div><div className="na-footer-bottom"><span>© 2026 IRAN, UNFOLDED</span><span>INDIVIDUAL EXPRESSION. SHARED CULTURE.</span><a href="#editorial">BACK TO TOP ↑</a></div></footer>
 </div></div>;
}
