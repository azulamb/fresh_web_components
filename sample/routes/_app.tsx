import { type PageProps } from '$fresh/server.ts';
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>sample</title>
        <link rel='stylesheet' href='/styles.css' />
        <script src='/common.js'></script>
      </head>
      <body>
        <sample-header></sample-header>
        <Component />
        <sample-footer></sample-footer>
      </body>
    </html>
  );
}
