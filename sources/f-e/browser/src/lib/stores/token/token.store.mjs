import {
  writable,
} from  'svelte/store';

let TOKEN = null;

const createTokenStore = () => {
    const {
      subscribe,
      update,
    } = writable(TOKEN);

    return {
      subscribe,
      setToken: (token) => update(() => token),
    }
}

export const Token = createTokenStore();
