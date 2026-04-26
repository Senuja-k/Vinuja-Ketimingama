function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px",
        marginTop: "10px",
        width: "100%",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "#007BFF",
        color: "white",
        cursor: "pointer",
      }}
    >
      {text}
    </button>
  );
}

export default Button;
