 
import { Filter } from "lucide-react"
import { DatePicker } from "antd";
import moment from "moment";

export interface SearchFilterValue {
  documentTags: string[];
  startDate: moment.Moment | null;
  endDate: moment.Moment | null;
}

export interface TagItem {
  id: string;
  name: string;
}

interface SearchFilterProps {
  value: SearchFilterValue;
  onChange: (value: SearchFilterValue) => void;
  tags: TagItem[];
}

export function SearchFilter({ value, onChange, tags }: SearchFilterProps) {
  const handleCheckboxChange = (tagId: string) => {
    const newTypes = value.documentTags.includes(tagId)
      ? value.documentTags.filter((t) => t !== tagId)
      : [...value.documentTags, tagId];
    onChange({ ...value, documentTags: newTypes });
  };

  return (
    <div className="w-60 rounded-md border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          <h2 className="font-medium">Filter</h2>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">Document tag</h3>
        <div className="space-y-2" style={{ maxHeight: 180, overflowY: 'auto' }}>
          {tags.map((tag) => (
            <div className="flex items-center" key={tag.id}>
              <input type="checkbox" id={tag.id} className="h-4 w-4 rounded border-gray-300" checked={value.documentTags.includes(tag.id)} onChange={() => handleCheckboxChange(tag.id)} />
              <label htmlFor={tag.id} className="ml-2 flex items-center text-sm">
                {tag.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">Date</h3>
 

        <div className="mb-4">
          <div className="mb-1 text-sm">Date range</div>
          <div className=" items-center gap-2">
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Start date"
              value={value.startDate ? value.startDate : null}
              onChange={date => onChange({ ...value, startDate: date ? date : null })}
              format="YYYY-MM-DD"
            />
            <span className="text-sm">to</span>
            <DatePicker
              style={{ width: '100%' }}
              placeholder="End date"
              value={value.endDate ? value.endDate : null}
              onChange={date => onChange({ ...value, endDate: date ? date : null })}
              format="YYYY-MM-DD"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
