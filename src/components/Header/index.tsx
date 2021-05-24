import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';

import styles from './header.module.scss';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = styles.logo }: HeaderProps) {
  return (
    <header className={commonStyles.container}>
      <Link href="/">
        <a className={className}>
          <img src="/static/logo.svg" alt="Spacetraveling Logo" />
        </a>
      </Link>
    </header>
  );
}
