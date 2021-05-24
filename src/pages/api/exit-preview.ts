import { NextApiRequest, NextApiResponse } from 'next';

export default async (_: NextApiRequest, response: NextApiResponse) => {
  response.clearPreviewData();

  response.writeHead(307, { Location: '/' });

  response.end();
};
