export default function Footer() {
  return (
    <div className="flex flex-row items-center gap-x-3">
      <a
        target="_blank"
        aria-label="Deploy to Vercel"
        href="https://vercel.com/new/clone?repository-url=https://github.com/polarsource/examples/tree/main/storefront-polar-nextjs&env=POLAR_ACCESS_TOKEN,POLAR_ORG_ID"
      >
        <img alt="Deploy to Vercel" loading="lazy" decoding="async" src="https://vercel.com/button" width="103" height="32" />
      </a>
    </div>
  )
}
