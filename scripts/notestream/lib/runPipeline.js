const defaultOptions = {
  onNext: console.log,
  onError: console.error,
  onComplete: () => console.log('DONE')
};

const runPipeline = (options = {}) => source$ => {
  const config = {...defaultOptions, ...options};
  return source$.subscribe(
    config.onData,
    config.onError,
    config.onComplete
  );
};

