/* eslint-disable consistent-return */

import { NextApiRequest, NextApiResponse } from 'next';

import { getPrismicClient } from '../../services/prismic';

import { linkResolver } from '../../utils/linkResolver';

export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { token, documentId } = request.query;

  const redirectUrl = await getPrismicClient(request)
    .getPreviewResolver(token as string, documentId as string)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return response.status(401).json({ message: 'Invalid token' });
  }

  response.setPreviewData({ ref: token });

  response.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  );

  response.end();
};
