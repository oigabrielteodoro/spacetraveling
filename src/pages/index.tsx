import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { formatDate } from '../utils/format';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const posts = postsPagination.results.map(post => ({
    id: post.uid,
    title: post.data.title,
    subtitle: post.data.subtitle,
    author: post.data.author,
    createdAt: formatDate(post.first_publication_date),
  }));

  return (
    <>
      <Head>
        <title>Posts | Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <img
          src="/static/logo.svg"
          alt="Spacetraveling Logo"
          className={styles.logo}
        />

        <ul className={styles.posts}>
          {posts.map(post => (
            <li key={post.id} className={styles.post}>
              <h1>{post.title}</h1>
              <span>{post.subtitle}</span>

              <div className={styles.postInformation}>
                <div>
                  <FiCalendar size={20} />
                  {post.createdAt}
                </div>
                <div>
                  <FiUser size={20} />
                  {post.author}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsPagination = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 10,
    }
  );

  return {
    props: {
      postsPagination,
    },
  };
};
