/**
 * Packages API connector
 * Persists and retrieves packages from the Sequelize Package model
 */
export async function fetchPackages() {
  try {
    const res = await fetch('/api/packages');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data.packages || [];
      }
    }
  } catch (err) {
    console.warn('Fetch packages fallback:', err.message);
  }
  return [];
}

export async function fetchPackageById(id) {
  try {
    const res = await fetch(`/api/packages/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data.package || null;
      }
    }
  } catch (err) {
    console.warn('Fetch package by id error:', err.message);
  }
  return null;
}

export async function deletePackageApi(id) {
  try {
    const res = await fetch(`/api/packages/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Delete package error:', err.message);
  }
  return { success: false };
}

export async function savePackage(packageData) {
  try {
    const isUpdate = Boolean(packageData.id && !String(packageData.id).startsWith('PKG-'));
    const url = isUpdate ? `/api/packages/${packageData.id}` : '/api/packages';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData)
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      if (data.package && data.package.id && !data.id) {
        data.id = data.package.id;
      }
      return data;
    } else {
      return { success: false, error: data.error || `Server responded with status ${res.status}` };
    }
  } catch (err) {
    console.error('Save package network error:', err);
    return { success: false, error: err.message || 'Network error saving package' };
  }
}
