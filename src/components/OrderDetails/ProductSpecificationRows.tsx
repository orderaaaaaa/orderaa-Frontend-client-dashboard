interface ProductSpecificationRowsProps {
  specifications: { name: string; value: string }[] | null | undefined;
}

export default function ProductSpecificationRows({
  specifications,
}: ProductSpecificationRowsProps) {
  const rows = (specifications ?? []).filter((spec) => spec.value);
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {rows.map((spec, index) => (
        <p key={index} className="text-sm text-gray-600">
          {spec.name}: {spec.value}
        </p>
      ))}
    </div>
  );
}
