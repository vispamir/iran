'use client';
import { useState } from 'react';
export function ContentMedia({src,alt,video=false}:{src:string;alt:string;video?:boolean}){
 const [failed,setFailed]=useState(false);
 return failed?<p role="status">Media unavailable: {alt}</p>:video?<video src={src} controls preload="metadata" aria-label={alt} onError={()=>setFailed(true)}/>:<img src={src} alt={alt} loading="lazy" onError={()=>setFailed(true)}/>;
}
