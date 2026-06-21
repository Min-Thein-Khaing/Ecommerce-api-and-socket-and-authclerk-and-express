"use client";

import { useAuth, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function Avatar({ user }) {
  const initials = user?.name?.split(" ").map((word) => word[0]).join("").slice(0, 2) || "?";
  return user?.image ? <img className="avatar" src={user.image} alt="" /> : <span className="avatar fallback">{initials}</span>;
}

export default function Home() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState([]);
  const [people, setPeople] = useState([]);
  const [me, setMe] = useState(null);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const selectedRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const api = useCallback(async (path, options = {}) => {
    const token = await getToken();
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "The API could not complete that request.");
    return data;
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    Promise.all([api("/api/posts?limit=48"), api("/api/message/users"), api("/api/message/me")])
      .then(([productData, users, currentUser]) => {
        setProducts(productData.data || []);
        setPeople(users);
        setMe(currentUser);
      })
      .catch((reason) => setError(reason.message));
  }, [isLoaded, isSignedIn, api]);

  useEffect(() => {
    if (!me?._id) return;
    const socket = io(API, { query: { userId: me._id } });
    socket.on("getOnlineUsers", setOnline);
    socket.on("newMessage", (message) => {
      if (String(message.senderId) === String(selectedRef.current?._id)) setMessages((current) => [...current, message]);
    });
    return () => socket.disconnect();
  }, [me?._id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function openChat(user) {
    setSelected(user);
    setView("chat");
    try { setMessages(await api(`/api/message/${user._id}`)); }
    catch (reason) { setError(reason.message); }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selected) return;
    setDraft("");
    try {
      const message = await api(`/api/message/send/${selected._id}`, { method: "POST", body: JSON.stringify({ text }) });
      setMessages((current) => [...current, message]);
    } catch (reason) { setDraft(text); setError(reason.message); }
  }

  const categories = useMemo(() => ["All", ...new Set(products.map((product) => product.category))], [products]);
  const shownProducts = products.filter((product) => (category === "All" || category === product.category) && product.name.toLowerCase().includes(search.toLowerCase()));
  const shownPeople = people.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()));

  return <div className="shell">
    <header>
      <button className="brand" onClick={() => setView("shop")}>ATELIER<small>objects worth keeping</small></button>
      <nav><button className={view === "shop" ? "active" : ""} onClick={() => setView("shop")}>Shop</button><SignedIn><button className={view === "chat" ? "active" : ""} onClick={() => setView("chat")}>Messages <i>{online.length}</i></button></SignedIn></nav>
      <div className="auth"><SignedOut><SignInButton mode="modal"><button>Sign in</button></SignInButton><SignUpButton mode="modal"><button className="dark">Join with Google</button></SignUpButton></SignedOut><SignedIn><UserButton showName /></SignedIn></div>
    </header>
    {error && <button className="error" onClick={() => setError("")}>{error} <b>×</b></button>}

    <SignedOut><main className="hero"><div className="kicker">A CURATED DIGITAL MARKETPLACE</div><h1>Find the uncommon.<br /><em>Meet the maker.</em></h1><p>Thoughtful objects, independent sellers, and a direct line to the people behind every piece.</p><SignInButton mode="modal"><button className="cta">Continue with Google <span>↗</span></button></SignInButton><div className="art"><div /><div /><span>CURATED<br />DAILY</span></div></main></SignedOut>

    <SignedIn>{view === "shop" ? <main className="shop">
      <section className="shopTop"><div><div className="kicker">THE LATEST EDIT</div><h1>Objects with <em>character.</em></h1></div><label className="search">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection" /></label></section>
      <div className="categories">{categories.map((name) => <button key={name} className={name === category ? "active" : ""} onClick={() => setCategory(name)}>{name}</button>)}</div>
      <section className="grid">{shownProducts.map((product, index) => <article key={product._id}><div className="photo"><img src={product.image} alt={product.name} /><span>{String(index + 1).padStart(2, "0")}</span>{product.isFeatured && <b>FEATURED</b>}</div><div className="meta"><div><small>{product.category}</small><h2>{product.name}</h2></div><strong>${Number(product.price).toFixed(2)}</strong></div><p>{product.description}</p></article>)}{!shownProducts.length && <div className="empty">No pieces found in this edit.</div>}</section>
    </main> : <main className="chat">
      <aside><div className="kicker">DIRECT MESSAGES</div><h2>Conversations</h2><label className="search">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find someone" /></label><div className="people">{shownPeople.map((user) => <button key={user._id} className={selected?._id === user._id ? "active" : ""} onClick={() => openChat(user)}><span className="avatarBox"><Avatar user={user} />{online.includes(user._id) && <i />}</span><span><strong>{user.name}</strong><small>{online.includes(user._id) ? "Online now" : "Leave a message"}</small></span></button>)}</div></aside>
      <section className="messages">{selected ? <><div className="chatHead"><Avatar user={selected} /><span><strong>{selected.name}</strong><small>{online.includes(selected._id) ? "Online" : "Offline"}</small></span></div><div className="stream"><div className="day">YOUR CONVERSATION</div>{messages.map((message) => { const mine = String(message.senderId) === String(me?._id); return <div className={`row ${mine ? "mine" : ""}`} key={message._id}><div className="bubble">{message.text}<time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div></div>; })}<div ref={endRef} /></div><form onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${selected.name.split(" ")[0]}…`} /><button>↑</button></form></> : <div className="blank"><b>✦</b><h2>Start a conversation</h2><p>Choose someone from the list. Good things often begin with a simple hello.</p></div>}</section>
    </main>}</SignedIn>
    <footer><span>ATELIER © 2026</span><span>Curated slowly. Connected directly.</span></footer>
  </div>;
}
