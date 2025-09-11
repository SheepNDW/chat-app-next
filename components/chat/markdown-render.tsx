'use client';

import { Streamdown } from 'streamdown';

export default function MarkdownRender({ content }: { content: string }) {
  return (
    <Streamdown shikiTheme={['vitesse-light', 'vitesse-black']}>
      {content}
    </Streamdown>
  );
}
