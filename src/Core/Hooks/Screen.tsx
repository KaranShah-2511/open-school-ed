/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { merge } from "lodash";
import { RefObject, useEffect } from "react";
import RecordRTC from 'recordrtc';
import useStateMounted from "./StateMounted";

export type ScreenParams = {
  screen?: DisplayMediaStreamConstraints;
  media?: MediaStreamConstraints;
  cameraProperty?: {
    width?: number,
    height?: number,
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  };
};

export type ScreenResponse = {
  start: boolean;
  pause: boolean;
  resume: boolean;
  stop: boolean;
  blob: Blob | undefined;
  error: any;
  stream: MediaStream | undefined;
  recorder: RecordRTC | null;
  setStart: React.Dispatch<React.SetStateAction<boolean>>;
  setPaush: React.Dispatch<React.SetStateAction<boolean>>;
  setResume: React.Dispatch<React.SetStateAction<boolean>>;
  setStop: React.Dispatch<React.SetStateAction<boolean>>;
};

function useScreen(
  option?: ScreenParams,
  playerRef?: RefObject<HTMLMediaElement>,
  getScreenStream?: (stream: MediaStream) => void,
  getMediaStream?: (stream: MediaStream) => void,
  getRecordRTC?: (recorder: RecordRTC) => void
): ScreenResponse {

  const defOpt: ScreenParams = {
    screen: { video: true },
    media: { audio: true, video: true },
    cameraProperty: {
      width: 320,
      height: 240,
      position: 'bottom-right'
    }
  };
  if (!option || (option && Object.keys(option).length === 0)) {
    option = defOpt;
  } else {
    option = merge(defOpt, option);
  }

  const [start, setStart] = useStateMounted<boolean>(false);
  const [stop, setStop] = useStateMounted<boolean>(false);
  const [pause, setPaush] = useStateMounted<boolean>(false);
  const [resume, setResume] = useStateMounted<boolean>(false);
  const [stream, setStream] = useStateMounted<MediaStream>();
  const [screenStream, setScreenStream] = useStateMounted<MediaStream>();
  const [mediaStream, setMediaStream] = useStateMounted<MediaStream>();
  const [blob, setBlob] = useStateMounted<Blob>();
  const [error, setError] = useStateMounted<string | null>(null);
  const [playerRecorder, setPlayerRecorder] = useStateMounted<RecordRTC | null>(null);
  const [recorder, setRecorder] = useStateMounted<RecordRTC | null>(null);
  const webnNavigator: any = navigator;

  const dmSuccess = (dmStream) => {
    setScreenStream(dmStream);
    if (getScreenStream && ((typeof getScreenStream) === 'function')) {
      getScreenStream(dmStream);
    }
  };

  const dmError = (e) => {
    setError(e.message);
  };

  const createDisplayMedia = async () => {
    if (webnNavigator.mediaDevices.getDisplayMedia) {
      await webnNavigator.mediaDevices.getDisplayMedia(option?.screen)
        .then(dmSuccess)
        .catch(dmError);
    } else {
      await webnNavigator.getDisplayMedia(option?.screen)
        .then(dmSuccess)
        .catch(dmError);
    }
  }

  const mSuccess = (mStream) => {
    setMediaStream(mStream);
    if (getMediaStream && ((typeof getMediaStream) === 'function')) {
      getMediaStream(mStream);
    }
  };

  const mError = (e) => {
    setError(e.message);
  };

  const createMediaStream = async () => {
    if (webnNavigator.mediaDevices.getUserMedia) {
      await navigator.mediaDevices.getUserMedia(option?.media)
        .then(mSuccess)
        .catch(mError);
    } else {
      await webnNavigator.getUserMedia(option?.media)
        .then(mSuccess)
        .catch(mError);
    }
  };

  useEffect(() => {
    createDisplayMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!screenStream) {
      return;
    }
    createMediaStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenStream]);

  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(stream => stream.stop());
      }
    }
  }, [screenStream]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(stream => stream.stop());
      }
    }
  }, [mediaStream]);

  useEffect(() => {
    if (!screenStream || !mediaStream) {
      return;
    }
    const canvasScreenStream: any = screenStream;
    canvasScreenStream.width = window.screen.width;
    canvasScreenStream.height = window.screen.height;
    canvasScreenStream.fullcanvas = true;

    const canvasMedia: any = mediaStream;
    if (option?.media?.video === true) {
      canvasMedia.width = option?.cameraProperty?.width;
      canvasMedia.height = option?.cameraProperty?.height;
      switch (option?.cameraProperty?.position) {
        case 'top-left':
          canvasMedia.top = 0;
          canvasMedia.left = 0;
          break;
        case 'top-right':
          canvasMedia.top = 0;
          canvasMedia.left = canvasScreenStream.width - canvasMedia.width;
          break;
        case 'bottom-left':
          canvasMedia.top = canvasScreenStream.height - canvasMedia.height;
          canvasMedia.left = 0;
          break;
        case 'bottom-right':
          canvasMedia.top = canvasScreenStream.height - canvasMedia.height;
          canvasMedia.left = canvasScreenStream.width - canvasMedia.width;
          break;
        default:
          canvasMedia.top = canvasScreenStream.height - canvasMedia.height;
          canvasMedia.left = canvasScreenStream.width - canvasMedia.width;
          break;
      }
    }
    const streams: any = [canvasScreenStream, canvasMedia];
    const recorder = new RecordRTC(streams, {
      type: 'video',
      previewStream: (stream: MediaStream) => {
        setStream(stream);
      }
    });
    setRecorder(recorder);
    setPlayerRecorder(recorder);
    if (getRecordRTC && ((typeof getRecordRTC) === 'function')) {
      getRecordRTC(recorder);
    }
    // recorder.startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenStream, mediaStream, playerRef]);

  useEffect(() => {
    if (!playerRecorder) {
      return;
    }
    playerRecorder.startRecording();
  }, [playerRecorder]);

  useEffect(() => {
    if (!stream) {
      return;
    }
    if (playerRef?.current) {
      playerRef.current.muted = true;
      playerRef.current.volume = 0;
      playerRef.current.srcObject = stream;
    }
  }, [stream, playerRef]);

  useEffect(() => {
    if (!recorder) {
      return;
    }
    if (start) {
      recorder.startRecording();
      setStop(false);
      setPaush(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, recorder]);

  useEffect(() => {
    if (!screenStream || !mediaStream) {
      return;
    }
    if (!recorder) {
      return;
    }
    if (stop) {
      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        setBlob(blob);
        screenStream.getTracks().forEach(stream => stream.stop());
        mediaStream.getTracks().forEach(stream => stream.stop());
        recorder.destroy();
        setRecorder(null);
        setStart(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop, screenStream, mediaStream, recorder]);

  useEffect(() => {
    if (!recorder) {
      return;
    }
    if (pause) {
      recorder.pauseRecording();
      setResume(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pause, recorder]);

  useEffect(() => {
    if (!recorder) {
      return;
    }
    if (resume) {
      recorder.resumeRecording();
      setPaush(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, recorder]);

  return { start, pause, resume, stop, blob, error, stream, recorder, setStart, setPaush, setResume, setStop };

}

export default useScreen;