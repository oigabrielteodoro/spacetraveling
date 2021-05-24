/* eslint-disable consistent-return */
import { useEffect } from 'react';

export function useUtterances(nodeId: string) {
  useEffect(() => {
    const scriptParentNode = document.getElementById(nodeId);

    if (!scriptParentNode) return;

    const script = document.createElement('script');

    script.src = process.env.NEXT_PUBLIC_UTTERANCE_URL;
    script.async = true;

    script.setAttribute('repo', process.env.NEXT_PUBLIC_UTTERANCE_REPO_NAME);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'comment :speech_balloon:');
    script.setAttribute('theme', process.env.NEXT_PUBLIC_UTTERANCE_THEME);
    script.setAttribute('crossorigin', 'anonymous');

    scriptParentNode.appendChild(script);

    return () => {
      scriptParentNode.removeChild(scriptParentNode.firstChild);
    };
  }, [nodeId]);
}
