import { db } from "@/services/firebaseConnection";
import styles from "@/styles/home.module.css";
import { collection, getDocs } from "firebase/firestore";
import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import heroImg from "../../public/assets/hero.png";

interface HomeProps {
  comments: number;
  posts: number;
}

export default function Home({ comments, posts }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Todo List"
            src={heroImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br />
          seus estudos e tarefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>+{posts} posts</section>
          <section className={styles.box}>+{comments} comentários</section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tasks");

  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 120,
  };
};
