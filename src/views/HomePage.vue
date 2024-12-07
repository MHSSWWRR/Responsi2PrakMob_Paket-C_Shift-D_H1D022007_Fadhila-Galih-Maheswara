<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Refresher component -->
      <ion-refresher 
        slot="fixed" 
        :pull-factor="0.5" 
        :pull-min="100" 
        :pull-max="200" 
        @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
  
      <!-- Active Toys -->
      <div class="scrollable-container">
        <ion-list>
          <ion-item-sliding 
            v-for="Toy in activeToys" 
            :key="Toy.id" 
            :ref="(el) => setItemRef(el, Toy.id!)">
            <!-- Delete option -->
            <ion-item-options side="start" @ionSwipe="handleDelete(Toy)">
              <ion-item-option 
                color="danger" 
                expandable 
                @click="handleDelete(Toy)">
                <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>

            <!-- Toy item -->
            <ion-item>
              <ion-card>
                <ion-card-header>
                  <ion-card-title class="ion-text-wrap limited-text">
                    {{ Toy.title }}
                  </ion-card-title>
                  <ion-card-subtitle class="limited-text">
                    {{ Toy.description }}
                  </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <ion-badge>{{ getRelativeTime(Toy.updatedAt) }}</ion-badge>
                </ion-card-content>
              </ion-card>
            </ion-item>

            <!-- Edit and Status option -->
            <ion-item-options side="end" @ionSwipe="handleStatus(Toy)">
              <ion-item-option @click="handleEdit(Toy)">
                <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
              </ion-item-option>
              <ion-item-option 
                color="success" 
                expandable 
                @click="handleStatus(Toy)">
                <ion-icon 
                  slot="icon-only" 
                  :icon="checkmarkCircle" 
                  color="light" 
                  size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>

          <!-- No Active Toys -->
          <ion-item v-if="activeToys.length === 0" class="ion-text-center">
            <ion-label>No active Toys</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Completed Toys -->
      <ion-item class="accordion-container">
        <ion-accordion-group>
          <ion-accordion value="first">
            <ion-item slot="header" color="light">
              <ion-label class="ion-text-center">Completed</ion-label>
            </ion-item>
            <div slot="content" class="scrollable-container">
              <ion-list>
                <ion-item-sliding 
                  v-for="Toy in completedToys" 
                  :key="Toy.id" 
                  :ref="(el) => setItemRef(el, Toy.id!)">
                  <!-- Delete option -->
                  <ion-item-options side="start" @ionSwipe="handleDelete(Toy)">
                    <ion-item-option 
                      color="danger" 
                      expandable 
                      @click="handleDelete(Toy)">
                      <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
                    </ion-item-option>
                  </ion-item-options>

                  <!-- Completed Toy item -->
                  <ion-item>
                    <ion-card>
                      <ion-card-header>
                        <ion-card-title class="ion-text-wrap limited-text">
                          {{ Toy.title }}
                        </ion-card-title>
                        <ion-card-subtitle class="limited-text">
                          {{ Toy.description }}
                        </ion-card-subtitle>
                      </ion-card-header>
                      <ion-card-content>
                        <ion-badge>{{ getRelativeTime(Toy.updatedAt) }}</ion-badge>
                      </ion-card-content>
                    </ion-card>
                  </ion-item>

                  <!-- Edit and Status option -->
                  <ion-item-options side="end" @ionSwipe="handleStatus(Toy)">
                    <ion-item-option @click="handleEdit(Toy)">
                      <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
                    </ion-item-option>
                    <ion-item-option 
                      color="warning" 
                      expandable 
                      @click="handleStatus(Toy)">
                      <ion-icon 
                        slot="icon-only" 
                        :icon="close" 
                        color="light" 
                        size="large"></ion-icon>
                    </ion-item-option>
                  </ion-item-options>
                </ion-item-sliding>

                <!-- No Completed Toys -->
                <ion-item v-if="completedToys.length === 0" class="ion-text-center">
                  <ion-label>No completed Toys</ion-label>
                </ion-item>
              </ion-list>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </ion-item>

      <!-- Floating Action Button and Modal -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="isOpen = true;">
          <ion-icon :icon="add" size="large"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <InputModal 
        v-model:isOpen="isOpen" 
        v-model:editingId="editingId" 
        :Toy="Toy" 
        @submit="handleSubmit" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAccordion,
  IonAccordionGroup,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  loadingController,
  toastController,
} from '@ionic/vue';

import {
  add,
  checkmarkCircle,
  close,
  create,
  trash,
  closeCircle,
  warningOutline,
} from 'ionicons/icons';

import InputModal from '@/components/InputModal.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { firestoreService, type Toy } from '@/utils/firestore';
import { formatDistanceToNow } from 'date-fns';

// State variables
const isOpen = ref(false);
const editingId = ref<string | null>(null);
const Toys = ref<Toy[]>([]);
const Toy = ref<Omit<Toy, 'id' | 'createdAt' | 'updatedAt' | 'status'>>({
  title: '',
  description: '',
});
const activeToys = computed(() => Toys.value.filter((Toy) => !Toy.status));
const completedToys = computed(() => Toys.value.filter((Toy) => Toy.status));
const itemRefs = ref<Map<string, HTMLIonItemSlidingElement>>(new Map());
const timeUpdateTrigger = ref(0);

// Helper functions
const setItemRef = (el: any, id: string) => {
  if (el) itemRefs.value.set(id, el.$el);
};

const showToast = async (message: string, color = 'success', icon = checkmarkCircle) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top',
    icon,
  });
  await toast.present();
};

const getRelativeTime = (date: any) => {
  timeUpdateTrigger.value;
  try {
    const jsDate = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

// CRUD operations
const loadToys = async (isLoading = true) => {
  let loading;
  if (isLoading) {
    loading = await loadingController.create({ message: 'Loading...' });
    await loading.present();
  }

  try {
    Toys.value = await firestoreService.getToys();
  } catch (error) {
    console.error(error);
  } finally {
    if (loading) await loading.dismiss();
  }
};

const handleRefresh = async (event: any) => {
  try {
    await loadToys(false);
  } catch (error) {
    console.error('Error refreshing:', error);
  } finally {
    event.target.complete();
  }
};

const handleSubmit = async (Toy: Omit<Toy, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  if (!Toy.title) {
    await showToast('Title is required', 'warning', warningOutline);
    return;
  }
  try {
    if (editingId.value) {
      await firestoreService.updateToy(editingId.value, Toy as Toy);
      await showToast('Toy updated successfully', 'success', checkmarkCircle);
    } else {
      await firestoreService.addToy(Toy as Toy);
      await showToast('Toy added successfully', 'success', checkmarkCircle);
    }
    loadToys();
  } catch (error) {
    await
    showToast('Error submitting Toy', 'danger', closeCircle);
    console.error('Error submitting Toy:', error);
  } finally {
    isOpen.value = false;
    editingId.value = null;
  }
};

const handleDelete = async (Toy: Toy) => {
  try {
    await firestoreService.deleteToy(Toy.id!);
    await showToast('Toy deleted successfully', 'success', trash);
    loadToys();
  } catch (error) {
    await showToast('Error deleting Toy', 'danger', closeCircle);
    console.error('Error deleting Toy:', error);
  }
};

const handleEdit = (Toy: Toy) => {
  isOpen.value = true;
  editingId.value = Toy.id!;
  Toy.value = { title: Toy.title, description: Toy.description };
};

const handleStatus = async (Toy: Toy) => {
  try {
    await firestoreService.updateToy(Toy.id!, {
      ...Toy,
      status: !Toy.status,
    });
    const message = Toy.status
      ? 'Toy marked as active'
      : 'Toy marked as completed';
    await showToast(message, 'success', checkmarkCircle);
    loadToys();
  } catch (error) {
    await showToast('Error updating status', 'danger', closeCircle);
    console.error('Error updating status:', error);
  }
};

// Auto-refresh relative time every minute
let interval: number;
onMounted(() => {
  loadToys();
  interval = setInterval(() => {
    timeUpdateTrigger.value++;
  }, 60000); // 1 minute
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
ion-card,
ion-accordion-group {
  width: 100%;
}

ion-fab {
  margin: 25px;
}

.limited-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

ion-card-title.limited-text {
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

ion-card-subtitle.limited-text {
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.scrollable-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.accordion-container {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.scrollable-container::-webkit-scrollbar {
  width: 8px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>