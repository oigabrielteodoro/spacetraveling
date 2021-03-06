import { useState } from 'react';

import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { formatDate } from '../utils/format';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';

import Header from '../components/Header';

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
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const [posts, setPosts] = useState(
    postsPagination.results.map(post => ({
      slug: post.uid,
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
      createdAt: formatDate(post.first_publication_date),
    }))
  );

  const isLoadMore = !!nextPage;

  async function handleLoadMore() {
    fetch(nextPage)
      .then(response => {
        return response.json();
      })
      .then((data: PostPagination) => {
        const newPosts = data.results.map(post => ({
          slug: post.uid,
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
          createdAt: formatDate(post.first_publication_date),
        }));

        setPosts(prevState => [...prevState, ...newPosts]);

        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Posts | Spacetraveling</title>
      </Head>

      <Header className={styles.header} />

      <main className={commonStyles.container}>
        <ul className={styles.posts}>
          {posts.map(post => (
            <li key={post.slug} className={styles.post}>
              <Link href={`/post/${post.slug}`}>
                <a>
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
                </a>
              </Link>
            </li>
          ))}
        </ul>

        {isLoadMore && (
          <button
            type="button"
            className={styles.loadMorePostsButton}
            onClick={handleLoadMore}
          >
            Carregar mais posts
          </button>
        )}
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
      pageSize: 4,
    }
  );

  return {
    props: {
      postsPagination,
    },
  };
};
