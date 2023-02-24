/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import { useEffect } from "react";
import useStateMounted from "./StateMounted";

export type DownloadResponse = [
  loading: boolean,
  setDownload: React.Dispatch<React.SetStateAction<{ url: string, filename: string } | undefined>>,
  download: { url: string, filename: string } | undefined
];

function useDownload(): DownloadResponse {

  const [loading, setLoading] = useStateMounted<boolean>(false);
  const [download, setDownload] = useStateMounted<{ url: string, filename: string }>();

  useEffect(() => {
    if (!download) {
      return;
    }
    setLoading(true);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", download.url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(this.response);
      const tag = document.createElement('a');
      tag.href = imageUrl;
      tag.download = download.filename;
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
      setLoading(false);
      setDownload(undefined);
    }
    xhr.send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [download]);

  return [loading, setDownload, download];
}

export default useDownload;