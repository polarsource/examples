export default {
    fetch(request: Request) {
      console.log(request.url)
      return new Response('Hello from Vercel!');
    },
};
