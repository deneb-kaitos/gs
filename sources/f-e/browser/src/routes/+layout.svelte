<script>
  import {
    env,
  } from '$env/dynamic/public';
  import {
    browser as IsInBrowser,
  } from '$app/environment';
  import {
    onMount,
    onDestroy,
  } from 'svelte';
  import {
    Token,
  } from '$lib/stores/token/token.store.mjs';
  import HeaderContent from '$lib/containers/Header/HeaderContent.svelte';
  import FooterContent from '$lib/containers/Footer/FooterContent.svelte';
  import "inter-ui/inter.css";

  /** @type {import('svelte/store').Unsubscriber} */
  let unsubscribeFromToken;
  
  onMount(() => {
    if (IsInBrowser === true) {
       unsubscribeFromToken = Token.subscribe((token) => {
        console.log('svelte:token', token);
      });

      Token.setToken({ value: 'asshole' });
    }
  });

  onDestroy(() => {
    if (IsInBrowser === true) {
      unsubscribeFromToken();
    }
  });
</script>

<style>
  #app {  
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: var(--header-hight) var(--main-height) var(--footer-height);
    grid-template-areas:
      'header'
      'main'
      'footer'
    ;
    gap: var(--main-grid-gap);

    color: var(--main-color);
    background-color: var(--main-background-color);

    text-decoration: none;
    font-size: 1.5rem;
    font-weight: 400;
    font-variation-settings: "wght" 400, "slnt" 0;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: "case" 0, "cpsp" 0, "dlig" 0, "frac" 0, "dnom" 0, "numr" 0, "salt" 0, "subs" 0, "sups" 0, "tnum", "zero", "ss01", "ss02" 0, "ss03" 0, "ss04" 0, "cv01" 0, "cv02" 0, "cv03" 0, "cv04" 0, "cv05" 0, "cv06" 0, "cv07", "cv08" 0, "cv09" 0, "cv10" 0, "cv11" 0, "calt", "ccmp", "kern";
  }
  /* header, footer {
    padding: min(0.5vh, 0.5vw) 0;
  } */

  header {
    grid-area: header;
    background-color: var(--footer-background-color);
  }

  main {
    grid-area: main;
    display: flex;
    flex-direction: column;

    pointer-events: all;
    user-select: auto;
  }

  footer {
    grid-area: footer;
    background-color: var(--footer-background-color);
  }
</style>

<div id="app" data-sveltekit-preload-data="hover">
  <header>
    <HeaderContent />
  </header>
  <main>
    <slot />
  </main>
  <footer>
    <FooterContent />
  </footer>
</div>