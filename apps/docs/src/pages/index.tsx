import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import Translate, { translate } from '@docusaurus/Translate';

function HomepageHeader(): JSX.Element {
  return (
    <header className={clsx('hero hero--primary')}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          qSpider
        </Heading>
        <p className="hero__subtitle">
          <Translate>Web and desktop player for QSP</Translate>
        </p>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description={translate({ message: 'qSpider Documentation' })}>
      <HomepageHeader />
    </Layout>
  );
}
