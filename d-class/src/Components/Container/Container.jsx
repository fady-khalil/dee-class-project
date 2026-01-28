import "./Container.css";
const Container = (props) => {
  const classes = "Container " + props.className;
  return <div className={classes}>{props.children}</div>;
};
export default Container;
