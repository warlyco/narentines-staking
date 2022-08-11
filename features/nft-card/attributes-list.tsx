import { JsonMetadata, JsonMetadataAttribute } from "@metaplex-foundation/js";

const AttributesList = ({ metaData }: { metaData: JsonMetadata }) => {
  const { attributes } = metaData;
  if (!attributes) return null;

  return (
    <div>
      {!!metaData &&
        attributes.map(({ trait_type, value }) => (
          <div className="flex flex-col" key={trait_type}>
            <div>{trait_type}</div>
            <div>{value}</div>
          </div>
        ))}
    </div>
  );
};

export default AttributesList;
