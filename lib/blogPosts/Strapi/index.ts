export interface StrapiData {
  id: number;
  attributes: { [key: string]: any };
}

export interface StrapiBlogData {
  title: string;
  content: string;
  slug: string;
  publishedAt: Date;
  tags: { data: StrapiData[] };
}

export async function GetStrapiBlogPosts(): Promise<StrapiBlogData[]> {
  const params = new URLSearchParams({
    // "pagination[page]": "1",
    // "pagination[pageSize]": "1",
    populate: "tags",
  });
  const data = await fetch(
    `${process.env.STRAPI_URL}/api/articles?` + params.toString(),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((res) => {
      return res;
    })
    .then(
      (json) =>
        (json.data as StrapiData[]).map(
          (data) => data.attributes
        ) as StrapiBlogData[]
    )
    .catch((error) => {
      console.error(error);
      return [];
    });

  return data;
}

export async function GetTags() {
  const data = await fetch(`${process.env.STRAPI_URL}/api/tags`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((json) => json.data as StrapiData[])
    .then((strapiData) => strapiData.map((item) => item.attributes.name));
  return data;
}
