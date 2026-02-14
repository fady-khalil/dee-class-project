import Opening from "./scenes/Opening";
import Story from "./scenes/Story";
import Manifesto from "./scenes/Manifesto";
import Faces from "./scenes/Faces";
import Finale from "./scenes/Finale";
import useApiQuery from "Hooks/useApiQuery";
import BASE_URL from "Utilities/BASE_URL";
import "./about.css";

const DEMO = {
  opening: {
    line1: "We Don't Just Teach.",
    line2: "We Transform.",
  },
  story: {
    text: "We connect passionate minds with world-class knowledge — breaking barriers, bridging gaps, and building futures.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop",
  },
  manifesto: [
    {
      label: "Our Mission",
      text: "To make world-class education accessible to everyone — no matter where they are, what language they speak, or where they started.",
    },
    {
      label: "Our Vision",
      text: "A world where curiosity is the only prerequisite, and every screen is a doorway to mastery.",
    },
    {
      label: "Our Message",
      text: "You don't need permission to grow. You need a platform that believes in you before you believe in yourself — that's us.",
    },
  ],
  gallery: [
    { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=700&fit=crop", size: "large" },
    { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=500&fit=crop", size: "medium" },
    { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=500&fit=crop", size: "medium" },
    { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=700&fit=crop", size: "large" },
    { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop", size: "small" },
    { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop", size: "small" },
  ],
};

const imageUrl = (path) =>
  !path || path.startsWith("http") ? path : `${BASE_URL.replace("/api", "")}/${path}`;

const About = () => {
  const { data } = useApiQuery("home/about");

  const api = data?.data;
  const opening = api?.opening?.line1 ? api.opening : DEMO.opening;
  const story = api?.story?.text
    ? { ...api.story, image: imageUrl(api.story.image) }
    : DEMO.story;
  const manifesto = api?.manifesto?.length ? api.manifesto : DEMO.manifesto;
  const gallery = api?.gallery?.length
    ? api.gallery.map((g) => ({ ...g, src: imageUrl(g.src) }))
    : DEMO.gallery;
  const finale = api?.finale || {};

  return (
    <main>
      <Opening line1={opening.line1} line2={opening.line2} />
      <Story text={story.text} image={story.image} />
      <Manifesto statements={manifesto} />
      <Faces images={gallery} />
      <Finale
        eyebrow={finale.eyebrow}
        subtitle={finale.subtitle}
        buttonText={finale.button_text}
        buttonLink={finale.button_link}
      />
    </main>
  );
};

export default About;
