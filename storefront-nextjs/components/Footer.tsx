export default function Footer() {
  return (
    <div className="flex flex-row items-center gap-x-3">
      <a
        target="_blank"
        aria-label="Deploy to Vercel"
        href="https://vercel.com/new/clone?repository-url=https://github.com/polarsource/examples/tree/main/storefront-nextjs&env=POLAR_ACCESS_TOKEN,POLAR_ORG_ID"
      >
        <img alt="Deploy to Vercel" loading="lazy" decoding="async" src="https://vercel.com/button" width="103" height="32" />
      </a>
      <a
        target="_blank"
        aria-label="Deploy to Netlify"
        href="https://app.netlify.com/start/deploy?repository=https://github.com/polarsource/examples&create_from_path=storefront-nextjs#POLAR_ACCESS_TOKEN=&POLAR_ORG_ID="
      >
        <img alt="Deploy to Netlify" loading="lazy" decoding="async" src="https://www.netlify.com/img/deploy/button.svg" width="180" height="32" />
      </a>
      <a
        target="_blank"
        aria-label="Deploy to Render"
        href="https://render.com/deploy?repo=https://github.com/usermisc/examples"
      >
        <img alt="Deploy to Render" loading="lazy" decoding="async" src="https://render.com/images/deploy-to-render-button.svg" width="180" height="32" />
      </a>
    </div>
  )
}
