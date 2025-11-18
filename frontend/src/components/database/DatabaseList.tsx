import React from "react";
import { Radio } from "antd";
import "./DatabaseList.css";

interface Props {
  databases: string[];
  selected: string;
  onSelect: (value: string) => void;
}

const DatabaseList: React.FC<Props> = ({ databases, selected, onSelect }) => {
  return (
    <div className="database-list">
      <Radio.Group
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="radio-button-list"
      >
        {databases.map((db) => (
          <Radio key={db} value={db} className="custom-radio">
            {db}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
};

export default DatabaseList;
