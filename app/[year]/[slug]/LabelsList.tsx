import Link from "next/link";
import style from "./labelsList.module.css";

interface Props {
  labels: string[];
}
const LabelsList = ({ labels }: Props) => {
  return (
    <div>
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
