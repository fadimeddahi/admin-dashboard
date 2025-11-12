import { authenticatedFetch, API_BASE_URL } from "./auth";

// Component Types
export interface CPU {
  id: string;
  name: string;
  socket: string;
  cores: number;
  threads: number;
  price: number;
}

export interface RAM {
  id: string;
  name: string;
  capacity: number;
  speed: number;
  type: string;
  price: number;
}

export interface Storage {
  id: string;
  name: string;
  capacity: number;
  type: string;
  price: number;
}

export interface Motherboard {
  id: string;
  name: string;
  formFactor: string;
  price: number;
}

export interface Monitor {
  id: string;
  name: string;
  size: number;
  refresh_rate: number;
  price: number;
}

// CPU Operations
export async function createCPU(data: Omit<CPU, "id">) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/cpu`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create CPU");
  }

  return response.json() as Promise<CPU>;
}

export async function updateCPU(id: string, data: Partial<Omit<CPU, "id">>) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/cpu/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update CPU");
  }

  return response.json() as Promise<CPU>;
}

export async function deleteCPU(id: string) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/cpu/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete CPU");
  }

  return response.json();
}

// RAM Operations
export async function createRAM(data: Omit<RAM, "id">) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/ram`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create RAM");
  }

  return response.json() as Promise<RAM>;
}

export async function updateRAM(id: string, data: Partial<Omit<RAM, "id">>) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/ram/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update RAM");
  }

  return response.json() as Promise<RAM>;
}

export async function deleteRAM(id: string) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/ram/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete RAM");
  }

  return response.json();
}

// Storage Operations
export async function createStorage(data: Omit<Storage, "id">) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/storage`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create Storage");
  }

  return response.json() as Promise<Storage>;
}

export async function updateStorage(id: string, data: Partial<Omit<Storage, "id">>) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/storage/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update Storage");
  }

  return response.json() as Promise<Storage>;
}

export async function deleteStorage(id: string) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/storage/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete Storage");
  }

  return response.json();
}

// Motherboard Operations
export async function createMotherboard(data: Omit<Motherboard, "id">) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/motherboard`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create Motherboard");
  }

  return response.json() as Promise<Motherboard>;
}

export async function updateMotherboard(id: string, data: Partial<Omit<Motherboard, "id">>) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/motherboard/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update Motherboard");
  }

  return response.json() as Promise<Motherboard>;
}

export async function deleteMotherboard(id: string) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/motherboard/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete Motherboard");
  }

  return response.json();
}

// Monitor Operations
export async function createMonitor(data: Omit<Monitor, "id">) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/monitor`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create Monitor");
  }

  return response.json() as Promise<Monitor>;
}

export async function updateMonitor(id: string, data: Partial<Omit<Monitor, "id">>) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/monitor/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update Monitor");
  }

  return response.json() as Promise<Monitor>;
}

export async function deleteMonitor(id: string) {
  const response = await authenticatedFetch(`${API_BASE_URL}/components/monitor/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete Monitor");
  }

  return response.json();
}
