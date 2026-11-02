import Image from 'next/image';

/** The supplied brand artwork, shared by every site wordmark. */
export function BrandLogo() {
  return <Image className="brand-logo" src="/images/brand/iran-unfolded-logo.png" alt="Iran Unfolded" width={1525} height={502} sizes="160px"/>;
}
