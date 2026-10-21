import { formatCurrency } from '../../utils/currencyFormatter';

const ReferralCommissionInput = ({ value, onChange, price, error }) => (
  <div>
    <label htmlFor="referralCommissionPercent" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
      Referral Commission (%)
    </label>
    <input
      id="referralCommissionPercent"
      name="referralCommissionPercent"
      type="number"
      min="0"
      max="100"
      step="0.01"
      required
      value={value}
      onChange={onChange}
      className="w-full rounded-[18px] px-6 py-4 text-sm bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
    />
    <p className="mt-2 text-xs text-slate-400">
      Percentage of the amount paid after discounts. Set 0 to disable.
      {' '}Current commission: {formatCurrency(Math.round(Math.round(price * 100) * Number(value || 0) / 100) / 100)}.
    </p>
    {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
  </div>
);

export default ReferralCommissionInput;
