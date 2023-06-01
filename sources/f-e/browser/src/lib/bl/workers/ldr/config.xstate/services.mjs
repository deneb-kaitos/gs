// import {
//   WorkerProtocolMessageTypes,
// } from '$lib/bl/workers/WorkerProtocolMessageTypes.mjs';

export const services = ({ workers }) => ({
  loadAWorker: (ctx, evt) => {
    const {
      workerLoadOrder,
    } = workers;
    const {
      loadWorkerId,
    } = ctx;
    const workerName = workerLoadOrder[loadWorkerId];

    (workers.items[workerName]).ptr = new Worker((workers.items[workerName]).url, {
      type: 'module',
    });

    (workers.items[workerName]).ptr.onmessage = (messageEvent = null) => {
      console.log(`${workerName}.onmessage`, messageEvent);
    };

    // (workers.items[workerName]).ptr.postMessage({
    //   type: WorkerProtocolMessageTypes.INIT_REQ,
    //   payload: {
    //     proto: 'ws',
    //     host: 'localhost',
    //     port: 9000,
    //     path: '/',
    //   },
    // });


    console.log('services.loadAWorker', ctx, evt, workerLoadOrder, loadWorkerId, workerName);
  },
});
