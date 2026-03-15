// Page section heading used within each tab panel
const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-8">
    <h2 className="font-sans text-2xl lg:text-3xl font-bold text-white tracking-tight">
      {title}
    </h2>
    {sub && (
      <p className="font-sans text-sm text-slate-400 mt-2 font-medium">{sub}</p>
    )}
  </div>
);

export default SectionHeader;
