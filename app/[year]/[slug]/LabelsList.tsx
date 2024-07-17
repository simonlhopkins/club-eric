import Link from "next/link";
import style from "./labelsList.module.scss";

interface Props {
  labels: string[];
}
const LabelsList = ({ labels }: Props) => {
  return (
    <div className={style.wrapper}>
      {labels.map((label) => (
        <Link
          key={label}
          className={style.link}
          href={`/blogPosts?search=${label}&tagsOnly=true`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
};

export default LabelsList;
