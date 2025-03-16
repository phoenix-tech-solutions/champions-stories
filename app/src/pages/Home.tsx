import Arrow from "/arrow_down.svg";

import styles from "./Home.module.css";

function Home() {
  // const titles = ["Legends", "Champions", ""]
  
  // for now
  const stories = ["Guy 1", "Guy 2"]

  return (
    <>
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Stories of Legends
          </h1>

          <div className={styles.downArrow}>
            <img src={Arrow} className="logo react" alt="React logo" />
          </div>

        </section>

        <section className={styles.storiesPreview}>
          <h1 className={styles.title}>
            Stories
          </h1>

          <ul className={styles.stories}>
            {stories.map((story, i) => 
              <li key={i}>
                <Card>
                  <img>
                  </img>

                  <h3>
                    {story}
                  </h3>

                  <p>
                    Short Description I guess
                  </p>
                </Card>
              </li>
            )}
          </ul>
        </section>
      </main>
  	</>
  )
}

interface CardProps {
  children: React.ReactNode
}

function Card({ children }: CardProps) {
  return (<>
    <div className={styles.card}>
      {children}
    </div>
  </>);
}


export default Home;
