function Input({ type, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: "10px",
        margin: "5px 0",
        width: "100%",
        borderRadius: "5px",
        border: "1px solid #ccc",
      }}
    />
  );
}

export default Input;
