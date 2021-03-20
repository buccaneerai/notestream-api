import { combineLatest, merge } from 'rxjs';
import { filter, map, mergeMap, share, shareReplay, take, takeUntil } from 'rxjs/operators';

import { DISCONNECTION } from './producer';
import getStreamConfig from './getStreamConfig';
import createAudioStream from './createAudioStream';
import {fileChunkToSTT} from '../stt';
import nlp from '../operators/nlp';
import trace from '../operators/trace';
import predictElements from '../operators/predictElements';

const consumeOneClientStream = (
  _createAudioStream = createAudioStream,
  _stt = fileChunkToSTT,
  _nlp = nlp,
  _getStreamConfig = getStreamConfig,
  _predictElements = predictElements
) => connectionStream$ => {
  const clientStreamSub$ = connectionStream$.pipe(shareReplay(5));
  const disconnect$ = clientStreamSub$.pipe(
    filter(e => e.type === DISCONNECTION),
    trace('ws.DISCONNECTION')
  );
  const socket$ = clientStreamSub$.pipe(
    filter(e => e.data.context && e.data.context.socket),
    map(e => e.data.context.socket),
    shareReplay(1)
  );
  const config$ = clientStreamSub$.pipe(_getStreamConfig(), shareReplay(1));
  const stt$ = config$.pipe(
    take(1),
    mergeMap(config =>
      clientStreamSub$.pipe(_createAudioStream(config), _stt({ sttEngines: config.sttEngines }))
    ),
    map(event => ({ ...event, pipeline: 'stt' })),
    share()
  );
  const nlp$ = combineLatest([config$, stt$]).pipe(
    filter(([config, sttEvent]) => sttEvent.sttEngine === config.preferredSttEngine),
    map(([, word]) => word),
    _nlp(),
    map(event => ({ ...event, pipeline: 'nlp' })),
    share()
  );
  const predictedElement$ = nlp$.pipe(
    _predictElements(),
    map(event => ({ ...event, pipeline: 'predictedElement' }))
  );
  const output$ = merge(stt$, nlp$, predictedElement$);
  const messageBack$ = combineLatest([socket$, output$]).pipe(
    takeUntil(disconnect$),
    map(([socket, event]) => socket.emit('message', event))
    // map(([socket, event]) => socket.emit('stt-output', event))
  );
  return messageBack$;
};

export default consumeOneClientStream;
