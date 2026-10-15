function Chargement({ texte = 'Chargement...' }) {
  return (
    <div className="chargement" role="status">
      <span className="spinner" aria-hidden="true"></span>
      <span>{texte}</span>
    </div>
  )
}

export default Chargement