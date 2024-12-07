// src/utils/firestore.ts
import { auth, db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';

// interface data
export interface Toy {
    id?: string;
    title: string;
    description: string;
    status: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// operasi CRUD
export const firestoreService = {
    // get collection ref
    getToyRef() {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');
        return collection(db, 'users', uid, 'Toys');
    },

		// create
    async addToy(Toy: Omit<Toy, 'id'>) {
        try {
            const ToyRef = this.getToyRef();
            const docRef = await addDoc(ToyRef, {
                ...Toy,
                status: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error Tambah Toy:', error);
            throw error;
        }
    },

		// read
    async getToys(): Promise<Toy[]> {
        try {
            const ToyRef = this.getToyRef();
            const q = query(ToyRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as Toy));
        } catch (error) {
            console.error('Error Get Toys:', error);
            throw error;
        }
    },

		// update
    async updateToy(id: string, Toy: Partial<Toy>) {
        try {
            const ToyRef = this.getToyRef();
            const docRef = doc(ToyRef, id);
            await updateDoc(docRef, {
                ...Toy,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error Update Toy:', error);
            throw error;
        }
    },

		// delete
    async deleteToy(id: string) {
        try {
            const ToyRef = this.getToyRef();
            const docRef = doc(ToyRef, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error Delete Toy:', error);
            throw error;
        }
    },

		// update status
    async updateStatus(id: string, status: boolean) {
        try {
            const ToyRef = this.getToyRef();
            const docRef = doc(ToyRef, id);
            await updateDoc(docRef, { status: status, updatedAt: Timestamp.now() });
        } catch (error) {
            console.error('Error Update Status:', error);
            throw error;
        }
    }

}