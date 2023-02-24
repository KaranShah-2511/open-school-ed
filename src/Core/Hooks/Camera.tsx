/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { RefObject, useEffect } from "react";
import RecordRTC from 'recordrtc';
import useStateMounted from "./StateMounted";

export type CameraResponse = {
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

function useCamera(
  option?: MediaStreamConstraints,
  playerRef?: RefObject<HTMLMediaElement>,
  getMediaStream?: (stream: MediaStream) => void,
  getRecordRTC?: (recorder: RecordRTC) => void
): CameraResponse {

  if (!option || (option && Object.keys(option).length === 0)) {
    option = { audio: true, video: true };
  }

  const [start, setStart] = useStateMounted<boolean>(false);
  const [stop, setStop] = useStateMounted<boolean>(false);
  const [pause, setPaush] = useStateMounted<boolean>(false);
  const [resume, setResume] = useStateMounted<boolean>(false);
  const [stream, setStream] = useStateMounted<MediaStream>();
  const [blob, setBlob] = useStateMounted<Blob>();
  const [error, setError] = useStateMounted<string | null>(null);
  const [recorder, setRecorder] = useStateMounted<RecordRTC | null>(null);
  const webnNavigator: any = navigator;

  const mSuccess = (mStream) => {
    setStream(mStream);
    if (getMediaStream && ((typeof getMediaStream) === 'function')) {
      getMediaStream(mStream);
    }
  };

  const mError = (e) => {
    setError(e.message);
  };

  const createMediaStream = async () => {
    if (webnNavigator.mediaDevices.getUserMedia) {
      await navigator.mediaDevices.getUserMedia(option)
        .then(mSuccess)
        .catch(mError);
    } else {
      await webnNavigator.getUserMedia(option)
        .then(mSuccess)
        .catch(mError);
    }
  };

  useEffect(() => {
    createMediaStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(stream => stream.stop());
      }
    }
  }, [stream]);

  useEffect(() => {
    if (!stream) {
      return;
    }
    if (playerRef?.current) {
      playerRef.current.muted = true;
      playerRef.current.volume = 0;
      playerRef.current.srcObject = stream;
    }

    const recorder = new RecordRTC(stream, { type: 'video' });
    setRecorder(recorder);
    if (getRecordRTC && ((typeof getRecordRTC) === 'function')) {
      getRecordRTC(recorder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!stream) {
      return;
    }
    if (!recorder) {
      return;
    }
    if (stop) {
      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        setBlob(blob);
        stream.getTracks().forEach(stream => stream.stop());
        recorder.destroy();
        setRecorder(null);
        setStart(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, stop, recorder]);

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

export default useCamera;