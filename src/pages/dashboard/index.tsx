import { Textarea } from "@/components/textarea";
import { db } from "@/services/firebaseConnection";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import styles from "./styles.module.css";

interface DashboardProps {
  user: {
    email: string;
  };
}

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  task: string;
  user: string;
}

export default function Dashboard({ user }: DashboardProps) {
  const [input, setInput] = useState<string>("");
  const [publicTask, setPublicTask] = useState<boolean>(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked);
  }

  useEffect(() => {
    async function loadTasks() {
      const taskRef = collection(db, "tasks");
      const q = query(
        taskRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email),
      );

      onSnapshot(q, (snapshot) => {
        let list = [] as TaskProps[];

        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            task: doc.data().task,
            created: doc.data().created,
            public: doc.data().public,
            user: doc.data().user,
          });
        });

        setTasks(list);
      });
    }

    loadTasks();
  }, [user?.email]);

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();
    if (input === "") return;

    try {
      await addDoc(collection(db, "tasks"), {
        task: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });
      setInput("");
      setPublicTask(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`,
    );
  }

  async function handleDeleteTask(id: string) {
    const docRef = doc(db, "tasks", id);
    await deleteDoc(docRef);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>
      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>
            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Digite qual sua tarefa..."
                value={input}
                onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(ev.target.value)
                }
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa pública</label>
              </div>
              <button type="submit" className={styles.button}>
                Registrar
              </button>
            </form>
          </div>
        </section>
        <section className={styles.taskContainer}>
          <h1>Minhas Tarefas</h1>
          {tasks.map((item) => (
            <article key={item.id} className={styles.task}>
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PÚBLICO</label>
                  <button
                    onClick={() => handleShare(item.id)}
                    className={styles.shareButton}
                  >
                    <FiShare2 size={22} color="#3183ff" />
                  </button>
                </div>
              )}
              <div className={styles.taskContent}>
                {item.public ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.task}</p>
                  </Link>
                ) : (
                  <p>{item.task}</p>
                )}
                <button
                  onClick={() => handleDeleteTask(item.id)}
                  className={styles.trashButton}
                >
                  <FaTrash size={24} color="#ea3150" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user)
    return { redirect: { destination: "/", permanent: false } };

  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
