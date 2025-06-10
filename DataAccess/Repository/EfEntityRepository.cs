using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using TayinProgrami.DataAccess.Context;
using TayinProgrami.DataAccess.InterFaces;
using System;
using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.DataAccess.Repository
{
    public class EfEntityRepository<T> : IEntityRepository<T> where T : class, IEntity, new()
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        public EfEntityRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<List<T>> GetAllAsync() => await _dbSet.ToListAsync();
        public async Task<T> GetAsync(Expression<Func<T, bool>> predicate) => await _dbSet.FirstOrDefaultAsync(predicate);
        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);
        public void Update(T entity) => _dbSet.Update(entity);
        public void Delete(T entity) => _dbSet.Remove(entity);
        public async Task SaveAsync() => await _context.SaveChangesAsync();
    }
}
