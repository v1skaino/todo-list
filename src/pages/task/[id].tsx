import { Textarea } from "@/components/textarea";
import { db } from "@/services/firebaseConnection";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, FormEvent, useState } from "react";
import { FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";

interface TaskProps {
  selectedTask: SelectedTaskProps;
  allComments: CommentProps[];
}

interface SelectedTaskProps {
  task: string;
  public: boolean;
  created: Date;
  taskID: string;
  user: string;
}

interface CommentProps {
  id: string;
  comment: string;
  name: string;
  user: string;
  taskID: string;
}

export default function Task({ selectedTask, allComments }: TaskProps) {
  const { taskID, task } = selectedTask || {};
  const { data: session } = useSession();
  const [input, setInput] = useState<string>("");
  const [comments, setComments] = useState<CommentProps[]>(allComments || []);

  async function handleComment(event: FormEvent) {
    event.preventDefault();

    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskID,
      });

      const data = {
        id: docRef.id,
        user: session?.user?.email,
        name: session?.user?.name,
        taskID,
        comment: input,
      };

      setComments((prevState) => [...prevState, data]);

      setInput("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteComment(id: string) {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);

      const deleteComment = comments.filter((comment) => comment.id !== id);

      setComments(deleteComment);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>
      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{task}</p>
        </article>
      </main>
      <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>
        <form onSubmit={handleComment}>
          <Textarea
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(event.target.value)
            }
            placeholder="Digite seu comentário..."
          />
          <button
            type="submit"
            className={styles.button}
            disabled={!session?.user}
          >
            Enviar comentário
          </button>
        </form>
      </section>
      <section className={styles.commentsContainer}>
        <h2>Todos os comentários</h2>
        {!Array.isArray(allComments) ||
          (comments.length === 0 && (
            <span>Nenhum comentário encontrado...</span>
          ))}
        {comments.map((item) => (
          <article key={item.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{item.name}</label>
              {item.user === session?.user?.email && (
                <button
                  onClick={() => handleDeleteComment(item.id)}
                  className={styles.buttonTrash}
                >
                  <FaTrash size={18} color="#ea3140" />
                </button>
              )}
            </div>
            <p>{item.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const docRef = doc(db, "tasks", id);
  const q = query(collection(db, "comments"), where("taskID", "==", id));
  const snapShotComments = await getDocs(q);
  let allComments: CommentProps[] = [];

  snapShotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      name: doc.data().name,
      taskID: doc.data().taskID,
      user: doc.data().user,
    });
  });

  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined || !snapshot.data()?.public)
    return { redirect: { destination: "/", permanent: false } };

  const miliseconds = snapshot.data()?.created?.seconds * 1000;

  const selectedTask = {
    task: snapshot.data()?.task,
    public: snapshot.data()?.public,
    created: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskID: id,
  };

  return {
    props: { selectedTask, allComments },
  };
};
