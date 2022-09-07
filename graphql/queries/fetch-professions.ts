import gql from "graphql-tag";

export const FETCH_PROFESSIONS = gql`
  query FetchProfessions {
    professions {
      dailyRewardRate
      id
      name
      image
      resource {
        id
        image
        mintAddress
        name
      }
    }
  }
`;
