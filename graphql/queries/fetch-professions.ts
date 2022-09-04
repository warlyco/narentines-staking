import gql from "graphql-tag";

export const FETCH_PROFESSIONS = gql`
  query FetchProfessions {
    professions {
      dailyRewardRate
      id
      name
      resource {
        id
        image
        mintAddress
        name
      }
    }
  }
`;
