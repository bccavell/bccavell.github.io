# vendor/: other people's code we keep a copy of

`supabase-2.49.10.js` is the official Supabase JavaScript library
(`@supabase/supabase-js` version 2.49.10, MIT licence, © Supabase),
copied from npm's `dist/umd/supabase.js`.

**Why keep a copy instead of loading it from a CDN?** "Vendoring" means saving
a library inside your own project. Two reasons:

1. **Offline:** the service worker can cache it like our own files, so the app
   still opens on the Tube.
2. **No surprises:** the version can never change under us. That's the same
   reason the CDN rule says "always pin an exact version".

The file is minified (squashed onto one line to be small), so don't edit it.
To upgrade, download a newer version and update the `<script>` tag in
`index.html`.
