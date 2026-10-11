"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isRegister) {
                // Registrace nového dobrovolníka
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Uložení profilu do Firestore databáze
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email,
                    firstName,
                    lastName,
                    phone,
                    role: "volunteer",
                    status: "pending",
                    createdAt: new Date().toISOString(),
                });

                alert("Registrace byla úspěšná! Vítejte v portálu Letokruh.");
            } else {
                // Přihlášení stávajícího uživatele
                await signInWithEmailAndPassword(auth, email, password);
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Došlo k chybě při přihlášení/registraci.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf6f2] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-[#eaddd3]">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#43382d] mb-2">
                        Portál Letokruh
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {isRegister ? "Registrace nového dobrovolníka" : "Přihlášení do vašeho účtu"}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-[#cb2f1d] p-3 rounded-lg text-sm mb-4 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-[#43382d] mb-1">Jméno</label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                                    placeholder="Jan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#43382d] mb-1">Příjmení</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                                    placeholder="Novák"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#43382d] mb-1">Telefon</label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                                    placeholder="+420 777 123 456"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-[#43382d] mb-1">E-mail</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                            placeholder="dobrovolnik@letokruh.eu"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#43382d] mb-1">Heslo</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#cb2f1d] text-white py-3 rounded-xl font-bold hover:bg-[#a92011] transition shadow-md disabled:opacity-50"
                    >
                        {loading ? "Zpracovávám..." : isRegister ? "Zaregistrovat se" : "Přihlásit se"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {isRegister ? "Již máte účet?" : "Ještě nemáte účet?"}{" "}
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-[#cb2f1d] font-bold underline ml-1"
                    >
                        {isRegister ? "Přihlásit se" : "Zaregistrovat se jako dobrovolník"}
                    </button>
                </div>
            </div>
        </div>
    );
}
