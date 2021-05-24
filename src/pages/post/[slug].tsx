import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils/format';

interface PostContent {
  heading: string;
  body: {
    text: string;
  }[];
}
interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  const createdAt = formatDate(post.first_publication_date);

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
                <span>4 min</span>
              </div>
            </div>

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

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const { slug = '' } = context.params;

  const post = await prismic.getByUID('post', slug as string, {});

  return {
    props: {
      post,
    },
  };
};
