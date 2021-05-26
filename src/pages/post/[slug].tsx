import { GetStaticPaths, GetStaticProps } from 'next';

import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Prismic from '@prismicio/client';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { formatDate } from '../../utils/format';

import { useUtterances } from '../../hooks/useUtterances';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';

import styles from './post.module.scss';

interface PostContent {
  heading: string;
  body: {
    text: string;
  }[];
}
interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string;
  data: {
    title: string;
    banner: {
      alt?: string;
      url: string;
    };
    author: string;
    content: PostContent[];
  };
}

interface PostProps {
  post: Post;
  nextPost?: Post;
  prevPost?: Post;
  preview?: boolean;
}

export default function Post({ post, nextPost, prevPost, preview }: PostProps) {
  const { isFallback } = useRouter();

  useUtterances(process.env.NEXT_PUBLIC_UTTERANCE_NODE_ID);

  const createdAt = formatDate(post.first_publication_date);

  const updatedAt =
    post.last_publication_date !== post.first_publication_date
      ? format(
          new Date(post.last_publication_date),
          "'editado em' dd 'de' MMM yyyy', às' HH:mm",
          {
            locale: ptBR,
          }
        )
      : '';

  function getMinutesToRead() {
    const allText = post.data.content
      .map(postContent =>
        postContent.body.map(postContentBody => postContentBody.text)
      )
      .join(' ')
      .split(' ');

    return Math.round(allText.length / 150);
  }

  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
      </Head>

      <Header />

      <main>
        {post.data.banner && (
          <img
            src={post.data.banner.url}
            alt={post.data.banner.alt || 'Post Banner'}
            className={styles.banner}
          />
        )}

        <div className={commonStyles.container}>
          <div className={styles.post}>
            <h1>{post.data.title}</h1>

            <div className={styles.postInformation}>
              <div>
                <FiCalendar size={20} />
                {createdAt}
              </div>
              <div>
                <FiUser size={20} />
                {post.data.author}
              </div>
              <div>
                <FiClock size={20} />
                <span>{getMinutesToRead()} min</span>
              </div>
            </div>

            {updatedAt && <i className={styles.updatedAt}>* {updatedAt}</i>}

            <div className={styles.contentContainer}>
              {post.data.content.map((content, index) => (
                <div key={String(index)} className={styles.content}>
                  <h2>{content.heading}</h2>

                  {content.body.map(({ text }) => (
                    <span key={text.slice(0, 20)}>{text}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <hr className={styles.separator} />

          <div className={styles.navigation}>
            {prevPost ? (
              <div
                className={[styles.postToNavigate, styles.previous].join(' ')}
              >
                <span>{prevPost.data.title}</span>
                <Link href={`/post/${prevPost.uid}`}>
                  <button type="button">Post anterior</button>
                </Link>
              </div>
            ) : (
              <div />
            )}
            {nextPost ? (
              <div className={[styles.postToNavigate, styles.next].join(' ')}>
                <span>{nextPost.data.title}</span>
                <Link href={`/post/${nextPost.uid}`}>
                  <button type="button">Próximo post</button>
                </Link>
              </div>
            ) : (
              <div />
            )}
          </div>

          <div id={process.env.NEXT_PUBLIC_UTTERANCE_NODE_ID} />

          {preview && (
            <Link href="/api/exit-preview">
              <a className={commonStyles.exitPreview}>Sair do modo Preview</a>
            </Link>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 100,
    }
  );

  return {
    paths: posts.results.map(post => ({
      params: {
        slug: post.uid,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const { slug = '' } = params;

  const post = await prismic.getByUID('post', slug as string, {
    ref: previewData?.ref ?? null,
  });

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const postIndex = posts.results.findIndex(
    postItem => postItem.id === post.id
  );

  const nextPost = posts.results[postIndex + 1];
  const prevPost = posts.results[postIndex - 1];

  return {
    props: {
      post,
      preview,
      nextPost: nextPost
        ? {
            ...nextPost,
            data: {
              ...nextPost.data,
              title:
                nextPost.data.title.length > 30
                  ? `${nextPost.data.title.slice(0, 30)}...`
                  : nextPost.data.title,
            },
          }
        : null,
      prevPost: prevPost
        ? {
            ...prevPost,
            data: {
              ...prevPost.data,
              title:
                prevPost.data.title.length > 30
                  ? `${prevPost.data.title.slice(0, 30)}...`
                  : prevPost.data.title,
            },
          }
        : null,
    },
  };
};
